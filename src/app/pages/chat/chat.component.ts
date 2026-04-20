import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { DefaultLoginLayoutComponent } from '../../componentes/default-login-layout/default-login-layout.component';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../types/chat-message.type';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DefaultLoginLayoutComponent],
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
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
      this.shouldScrollToBottom = false;
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
      next: ({ answer }) => {
        this.pushMessage('assistant', answer);
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

  private pushMessage(author: ChatMessage['author'], content: string) {
    this.messages = [
      ...this.messages,
      {
        id: Date.now() + this.messages.length,
        author,
        content
      }
    ];
    this.shouldScrollToBottom = true;
  }
}
