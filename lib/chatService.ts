// Simplified chat service for build
export const sendMessage = async (message: string) => {
  return {
    text: `This is a placeholder response to your message: "${message}"`,
    timestamp: new Date().toISOString(),
  };
};

export const getConversationHistory = async (userId: string) => {
  return [
    {
      id: '1',
      text: 'Welcome to the chat service!',
      sender: 'system',
      timestamp: new Date().toISOString(),
    }
  ];
};

export default {
  sendMessage,
  getConversationHistory,
}; 