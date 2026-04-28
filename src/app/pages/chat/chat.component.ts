import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { DefaultLoginLayoutComponent } from '../../componentes/default-login-layout/default-login-layout.component';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../types/chat-message.type';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DefaultLoginLayoutComponent, MarkdownModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  prompt = '';
  isLoading = false;
  userName = sessionStorage.getItem('username') ?? 'Usuário';
  messages: ChatMessage[] = [
    {
      id: 1,
      author: 'assistant',
      content: 'Olá! Sou sua inteligência artificial especializada. Como posso te ajudar hoje?'
    }
  ];

  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private toastService: ToastrService,
    private router: Router
  ) {}

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messagesContainer) {
      this.shouldScrollToBottom = false;
      this.scrollToBottom();
    }
  }

  sendMessage() {
    const message = this.prompt.trim();
    if (!message || this.isLoading) {
      return;
    }

    this.pushMessage('user', message);
    this.prompt = '';
    this.isLoading = true;

    this.chatService.sendMessage(message).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {
        const answer = this.extractAnswer(response);
        const suggestions = this.extractSuggestions(response);

        if (!answer) {
          this.pushMessage(
            'assistant',
            'Recebi a resposta, mas ela veio sem conteúdo de texto.'
          );
          this.toastService.warning('A resposta do agente veio vazia.');
          return;
        }

        this.pushMessage('assistant', answer, suggestions);
      },
      error: () => {
        this.pushMessage(
          'assistant',
          'Não consegui buscar a resposta do agente agora. Verifique se a API Java e o servidor Python estão em execução.'
        );
        this.toastService.error('Falha ao consultar o agente de IA.');
      }
    });
  }

  logout() {
    sessionStorage.removeItem('auth-token');
    sessionStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  trackByMessageId(index: number, message: ChatMessage) {
    return message.id;
  }

  handleSuggestionClick(text: string) {
    this.prompt = text;
    this.sendMessage(); 
  }
  
  private extractAnswer(response: unknown): string {
    if (!response || typeof response !== 'object') {
      return '';
    }

    const data = response as Record<string, unknown>;
    const rawAnswer = data['answer'] ?? data['response'] ?? data['message'] ?? data['content'];
    return typeof rawAnswer === 'string' ? rawAnswer.trim() : '';
  }

  private extractSuggestions(response: unknown): string[] {
    if (!response || typeof response !== 'object') {
      return [];
    }

    const data = response as Record<string, unknown>;
    const rawSuggestions = data['suggestions'];
    if (!Array.isArray(rawSuggestions)) {
      return [];
    }

    return rawSuggestions.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  private pushMessage(
    author: ChatMessage['author'],
    content: string,
    suggestions?: string[]
  ) {
    this.messages = [
      ...this.messages,
      {
        id: Date.now() + this.messages.length,
        author,
        content,
        suggestions
      }
    ];
    this.shouldScrollToBottom = true;
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      const element = this.messagesContainer?.nativeElement;

      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    });
  }

}
