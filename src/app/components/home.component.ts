import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardService, Card } from '../services/card.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <!-- Header Section -->
      <div class="hero-section">
        <h2 class="hero-title">Mis Tarjetas</h2>
        <p class="hero-subtitle">Consulta el saldo actual de tus tarjetas de transporte</p>
      </div>

      <!-- Cards Grid -->
      <div class="cards-grid">
        <div
          *ngFor="let card of cards; trackBy: trackByCardId"
          class="transport-card"
          [class.card--selected]="selectedCard?.id === card.id"
          [attr.data-type]="card.type"
          (click)="selectCard(card)"
        >
          <div class="card__header">
            <div class="card__icon-wrapper">
              <div class="card__icon" [style.background-color]="card.color">
                <span class="card__emoji">{{ card.type === 'metro' ? '🚇' : '🚌' }}</span>
              </div>
            </div>
            <div class="card__info">
              <h3 class="card__title">{{ card.name }}</h3>
              <p class="card__type">{{ card.type }}</p>
            </div>
            <div class="card__balance">
              <p class="balance-label">Saldo disponible</p>
              <p class="balance-amount" [ngClass]="getBalanceClass(card.balance)">
                S/ {{ card.balance.toFixed(2) }}
              </p>
            </div>
          </div>

          <div class="card__details">
            <div class="detail-item">
              <span class="detail-label">Tarifa por viaje:</span>
              <span class="detail-value">S/ {{ card.fare.toFixed(2) }}</span>
            </div>
            <!-- <div class="trips-available">
              {{ getTripsAvailable(card) }} viajes disponibles
            </div> -->
          </div>

          <div class="card__footer">
            <div class="status-wrapper">
              <span class="status-label">Estado:</span>
              <span class="status-badge" [ngClass]="getStatusClass(card.balance)">
                {{ getStatus(card.balance) }}
              </span>
            </div>
          </div>

          <!-- Card Hover Overlay -->
          <div class="card__overlay">
            <p class="overlay-text">Click para ver detalles</p>
          </div>
        </div>
      </div>

      <!-- Selected Card Details -->
      <div *ngIf="selectedCard" class="card-details-panel">
        <div class="panel-header">
          <h3 class="panel-title">Detalles de {{ selectedCard.type }}</h3>
          <button class="close-btn" (click)="selectedCard = null">×</button>
        </div>

        <div class="stats-grid">
          <div class="stat-card stat-card--balance">
            <div class="stat-icon">💰</div>
            <p class="stat-label">Saldo Actual</p>
            <p class="stat-value">S/ {{ selectedCard.balance.toFixed(2) }}</p>
          </div>

          <div class="stat-card stat-card--fare">
            <div class="stat-icon">🎫</div>
            <p class="stat-label">Tarifa</p>
            <p class="stat-value">S/ {{ selectedCard.fare.toFixed(2) }}</p>
          </div>

          <!-- <div class="stat-card stat-card--trips">
            <div class="stat-icon">🚇</div>
            <p class="stat-label">Viajes Disponibles</p>
            <p class="stat-value">{{ getTripsAvailable(selectedCard) }}</p>
          </div> -->
        </div>

        <div class="action-buttons">
          <button class="btn btn--primary" (click)="goToRecharge()">
            <span class="btn-icon">💳</span>
            Recargar
          </button>
          <button class="btn btn--secondary" (click)="goToUse()">
            <span class="btn-icon">🚇</span>
            Usar Tarjeta
          </button>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="quick-actions">
        <div class="action-card action-card--recharge">
          <div class="action-content">
            <h3 class="action-title">¿Necesitas recargar?</h3>
            <p class="action-description">Mantén tu tarjeta siempre lista para viajar</p>
            <button class="btn btn--light" (click)="goToRecharge()">
              Recargar ahora
            </button>
          </div>
          <!-- <div class="action-decoration">
            <div class="decoration-circle"></div>
            <div class="decoration-circle"></div>
          </div> -->
        </div>

        <div class="action-card action-card--use">
          <div class="action-content">
            <h3 class="action-title">¿Listo para viajar?</h3>
            <p class="action-description">Registra tu viaje y el número de pasajeros</p>
            <button class="btn btn--light" (click)="goToUse()">
              Usar tarjeta
            </button>
          </div>
          <!-- <div class="action-decoration">
            <div class="decoration-circle"></div>
            <div class="decoration-circle"></div>
          </div> -->
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  cards$: Observable<Card[]>;
  cards:any;
  selectedCard: any | null = null;

  constructor(
    private cardService: CardService,
    private router: Router
  ) {
    this.cards$ = this.cardService.cards$;

  }

  ngOnInit() {
    this.cardService.getCards().subscribe({
      next: (cards) => {
        console.log(cards);
        this.cards = cards;
      },
      error: (err) => {
        console.error('Error fetching cards:', err);
      }
    })
  }

  selectCard(card: Card) {
    // this.selectedCard = this.selectedCard?.id === card.id ? null : card;
    console.log(card.id);

    this.router.navigate(['/history', card.id]);
  }

  trackByCardId(index: number, card: Card): string {
    return card.id;
  }

  getTripsAvailable(card: Card): number {
    return Math.floor(card.balance / card.farePrice);
  }

  getBalanceClass(balance: number): string {
    if (balance <= 5) return 'text-red-600';
    if (balance <= 15) return 'text-yellow-600';
    return 'text-green-600';
  }

  getStatus(balance: number): string {
    if (balance <= 5) return 'Saldo Bajo';
    if (balance <= 15) return 'Saldo Medio';
    return 'Saldo Bueno';
  }

  getStatusClass(balance: number): string {
    if (balance <= 5) return 'bg-red-100 text-red-800';
    if (balance <= 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  goToRecharge() {
    this.router.navigate(['/recharge']);
  }

  goToUse() {
    this.router.navigate(['/use']);
  }
}
