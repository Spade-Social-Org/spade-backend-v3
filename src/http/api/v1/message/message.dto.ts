export class createMessageDto {
  sender_id: number;
  content: string;
  group_id?: number;
  receiver_id?: number;
  post_id?: number;
  parent_message_id?: number;
}
