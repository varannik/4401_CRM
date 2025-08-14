export interface EmailMetadata {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
  };
  recipients?: Array<{
    name: string;
    email: string;
  }>;
  toRecipients?: Array<{
    name: string;
    email: string;
  }>;
  ccRecipients?: Array<{
    name: string;
    email: string;
  }>;
  sentDateTime: string;
  receivedDateTime: string;
  hasAttachments: boolean;
  importance: string;
  conversationId: string;
  isRead: boolean;
}

export interface MeetingMetadata {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  organizer: {
    name: string;
    email: string;
  };
  attendees: Array<{
    name: string;
    email: string;
    response: string;
  }>;
  location?: {
    displayName: string;
    address?: any;
  };
  onlineMeeting?: {
    joinUrl: string;
  };
  isAllDay: boolean;
}


