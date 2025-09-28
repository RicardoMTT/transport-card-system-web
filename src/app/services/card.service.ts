import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Card {
  id: string;
  name: string;
  type: 'metro' | 'corredor';
  balance: number;
  color: string;
  farePrice: number;
}

export interface Transaction {
  id: string;
  cardId: string;
  type: 'recharge' | 'usage';
  amount: number;
  passengers?: number;
  date: Date;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private http: HttpClient) {}
  private cardsSubject = new BehaviorSubject<Card[]>([

  ]);

  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);

  cards$ = this.cardsSubject.asObservable();
  transactions$ = this.transactionsSubject.asObservable();

  getCards() {
    return this.http.get<Card[]>('https://transport-card-system-api-1.onrender.com/api/cards')
;
  }

  getCardById(id: string): Card | undefined {
    return this.cardsSubject.value.find(card => card.id === id);
  }

  rechargesCard(cardId: string, body:any) {
    return this.http.post<any[]>(`https://transport-card-system-api-1.onrender.com/api/cards/${cardId}/recharges`,body);
  }

  usagesCard(cardId: string, body:any) {
    return this.http.post<any[]>(`https://transport-card-system-api-1.onrender.com/api/cards/${cardId}/usages`,body);
  }
  rechargeCard(cardId: string, amount: number): void {
    const cards = this.cardsSubject.value;
    const cardIndex = cards.findIndex(card => card.id === cardId);

    if (cardIndex !== -1) {
      cards[cardIndex].balance += amount;
      this.cardsSubject.next([...cards]);

      // Agregar transacción
      this.addTransaction({
        id: Date.now().toString(),
        cardId,
        type: 'recharge',
        amount,
        date: new Date(),
        description: `Recarga de S/${amount.toFixed(2)}`
      });
    }
  }

  useCard(cardId: string, passengers: number): boolean {
    const cards = this.cardsSubject.value;
    const cardIndex = cards.findIndex(card => card.id === cardId);

    if (cardIndex !== -1) {
      const card = cards[cardIndex];
      const totalCost = card.farePrice * passengers;

      if (card.balance >= totalCost) {
        cards[cardIndex].balance -= totalCost;
        this.cardsSubject.next([...cards]);

        // Agregar transacción
        this.addTransaction({
          id: Date.now().toString(),
          cardId,
          type: 'usage',
          amount: totalCost,
          passengers,
          date: new Date(),
          description: `Viaje para ${passengers} persona${passengers > 1 ? 's' : ''}`
        });

        return true;
      }
    }

    return false;
  }

  private addTransaction(transaction: Transaction): void {
    const transactions = this.transactionsSubject.value;
    this.transactionsSubject.next([transaction, ...transactions]);
  }

  getTransactionsByCard(cardId: string): Transaction[] {
    return this.transactionsSubject.value.filter(t => t.cardId === cardId);
  }
}
