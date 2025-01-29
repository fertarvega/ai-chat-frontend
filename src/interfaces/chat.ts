export interface IMessage {
  role: string;
  content: string;
}

export interface IThreadChat {
  id: string;
  chatUuid: string;
  created_at: Date;
  message: IMessage;
}

export interface IChat {
  id: string;
  created_at: Date;
  topic: string;
}

