<template>
  <McLayout class="container">
    <McHeader :title="'AI 聊天助手'">
      <template #operationArea>
        <div class="operations">
          <i class="icon-helping"></i>
        </div>
      </template>
    </McHeader>
    
    <McLayoutContent
      v-if="startPage"
      class="hero"
    >
      <McIntroduction
        :title="'AI 聊天助手'"
        :subTitle="'Hi，欢迎使用 AI 聊天助手'"
        :description="description"
      ></McIntroduction>
      <McPrompt
        :list="introPrompt.list"
        :direction="introPrompt.direction"
        class="intro-prompt"
        @itemClick="onSubmit($event.label)"
      ></McPrompt>
    </McLayoutContent>
    
    <McLayoutContent class="content-container" v-else>
      <template v-for="(msg, idx) in messages" :key="idx">
        <McBubble
          v-if="msg.type === 'user'"
          :content="msg.content"
          :align="'right'"
          :avatar="userAvatar"
        ></McBubble>
        <McBubble 
          v-else 
          :content="msg.content" 
          :avatar="aiAvatar" 
          :loading="msg.loading" 
        ></McBubble>
      </template>
      <McBubble
        v-if="isStreaming"
        :content="streamingContent + '...'"
        :avatar="aiAvatar"
        :loading="true"
      ></McBubble>
    </McLayoutContent>
    
    <div class="shortcut">
      <McPrompt
        v-if="!startPage"
        :list="simplePrompt"
        :direction="'horizontal'"
        style="flex: 1"
        @itemClick="onSubmit($event.label)"
      ></McPrompt>
    </div>
    
    <McLayoutSender>
      <McInput
        v-model="inputMessage"
        :maxLength="2000"
        @change="(e) => (inputMessage = e)"
        @submit="sendMessage"
        :disabled="isStreaming"
      >
      </McInput>
    </McLayoutSender>
  </McLayout>
</template>

<script>
export default {
  name: 'ChatView',
  data() {
    return {
      messages: [],
      inputMessage: '',
      isStreaming: false,
      streamingContent: '',
      conversationId: null,
      startPage: true,
      userAvatar: 'https://picsum.photos/id/1005/40/40',
      aiAvatar: 'https://picsum.photos/id/1012/40/40',
      description: [
        'AI 聊天助手可以辅助研发人员编码、查询知识和相关作业信息、编写文档等。',
        '作为AI模型，提供的答案可能不总是确定或准确的，但您的反馈可以帮助做的更好。',
      ],
      introPrompt: {
        direction: 'horizontal',
        list: [
          {
            value: 'quickSort',
            label: '帮我写一个快速排序',
            iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
            desc: '使用 js 实现一个快速排序',
          },
          {
            value: 'helpMd',
            label: '你可以帮我做些什么？',
            iconConfig: { name: 'icon-star', color: 'rgb(255, 215, 0)' },
            desc: '了解当前AI可以帮你做的事',
          },
          {
            value: 'bindProjectSpace',
            label: '怎么绑定项目空间',
            iconConfig: { name: 'icon-priority', color: '#3ac295' },
            desc: '如何绑定云空间中的项目',
          },
        ],
      },
      simplePrompt: [
        {
          value: 'quickSort',
          iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
          label: '帮我写一个快速排序',
        },
        {
          value: 'helpMd',
          iconConfig: { name: 'icon-star', color: 'rgb(255, 215, 0)' },
          label: '你可以帮我做些什么？',
        },
      ]
    };
  },
  methods: {
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isStreaming) return;

      const userMessage = this.inputMessage.trim();
      this.messages.push({ type: 'user', content: userMessage, loading: false });
      this.inputMessage = '';
      this.isStreaming = true;
      this.streamingContent = '';
      this.startPage = false;

      try {
        await this.streamChat(userMessage);
      } catch (error) {
        console.error('聊天请求失败:', error);
        this.messages.push({
          type: 'ai',
          content: '抱歉，聊天请求失败，请稍后重试。',
          loading: false
        });
        this.isStreaming = false;
        this.streamingContent = '';
      }
    },

    async streamChat(message) {
      const requestBody = {
        message: message,
        conversationId: this.conversationId
      };

      try {
        const response = await fetch('http://localhost:8080/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data.trim()) {
                try {
                  const event = JSON.parse(data);
                  this.handleStreamEvent(event);
                } catch (e) {
                  console.error('解析SSE数据失败:', e, data);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('流式请求失败:', error);
        throw error;
      }
    },

    handleStreamEvent(event) {
      switch (event.type) {
        case 'start':
          // 开始接收流式数据
          this.conversationId = event.conversationId;
          this.streamingContent = '';
          break;

        case 'content':
          // 接收内容片段
          this.streamingContent += event.content;
          break;

        case 'done':
          // 流式传输完成
          if (this.streamingContent) {
            this.messages.push({
              type: 'ai',
              content: this.streamingContent,
              loading: false
            });
          }
          this.isStreaming = false;
          this.streamingContent = '';
          break;

        case 'error':
          // 错误处理
          this.messages.push({
            type: 'ai',
            content: event.content || '处理请求时出现错误',
            loading: false
          });
          this.isStreaming = false;
          this.streamingContent = '';
          break;
      }
    },

    async onSubmit(content) {
      this.inputMessage = content;
      await this.sendMessage();
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 1100px;
  margin: 24px auto 36px;
  min-height: 70vh;
  padding: 20px;
  gap: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 20px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
  padding: 20px;
  background-color: #f5f7fb;
  border: 1px solid #eef0f3;
  border-radius: 12px;
}

.shortcut {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0 4px;
}

:deep(.mc-bubble) {
  margin-bottom: 12px;
}
</style>