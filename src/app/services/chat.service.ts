import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatResponse } from '../types/chat-response.type';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8081/chat';

  constructor(private httpClient: HttpClient) {}

  sendMessage(message: string) {
    const token = sessionStorage.getItem('auth-token') ?? '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.httpClient.post<ChatResponse>(this.apiUrl, { message }, { headers });
  }
}
