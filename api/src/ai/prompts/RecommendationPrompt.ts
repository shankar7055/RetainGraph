export const getRecommendationPrompt = (contextStr: string): string => {
  return `You are a Customer Success Recommendation engine. Based on the provided client context, output prioritized recommendations.
  
  Context:
  ${contextStr}
  `;
};
