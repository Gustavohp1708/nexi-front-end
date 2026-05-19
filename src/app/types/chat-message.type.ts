export type ChatAuthor = 'assistant' | 'user';

export type ChatMessage = {
    id: number;
    author: ChatAuthor;
    content: string;
    suggestions?: string[];
};
