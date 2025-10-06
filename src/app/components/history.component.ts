import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { CardService } from "../services/card.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="history-container">
      <h2 class="history-title">Historial de movimientos</h2>

      <div *ngIf="loading" class="loading-indicator" style="text-align: center; margin-top: 20px;">
        <span class="loading-icon">⏳ Cargando historial...</span>
      </div>
        
      <div *ngIf="!loading && history.length === 0" class="no-history">
        No hay movimientos registrados.
      </div>
      
      
      <div *ngIf="!loading && history.length > 0">
        <div class="history-list">
          <div *ngFor="let item of history"
              class="history-card"
              [class.recharge]="item.type === 'RECHARGE'"
              [class.usage]="item.type === 'USAGE'">

            <!-- Icono -->
            <div class="history-left">
              <div class="history-icon" [class.icon-recharge]="item.type === 'RECHARGE'" [class.icon-usage]="item.type === 'USAGE'">
                <ng-container *ngIf="item.type === 'RECHARGE'; else usageIcon">
                  ＋
                </ng-container>
                <ng-template #usageIcon>−</ng-template>
              </div>
              <div>
                <p class="history-description">{{ item.description }}</p>
                <p class="history-date">{{ formatDate(item.date) }}</p>
              </div>
            </div>

            <!-- Monto -->
            <div class="history-amount" [class.amount-recharge]="item.type === 'RECHARGE'" [class.amount-usage]="item.type === 'USAGE'">
              S/. {{ item.amount |  number:'1.2-2' }}
            </div>
          </div>
        </div>
      </div>



  




    </div>


  `
})
export class HistoryComponent implements OnInit {

  history: any[] = [];
  id: number;
  loading: boolean = false;

  constructor(
    private cardService: CardService,
    private route: ActivatedRoute
  ) {
      this.id = Number(this.route.snapshot.paramMap.get('id'));
      this.getHistory();

  }
  ngOnInit(): void {

  }
  getHistory() {
    this.loading = true;
    this.cardService.getHistory(this.id).subscribe(data => {
      this.history = data;
      console.log(this.history);
      this.loading = false;
    },
    error => {
      console.error('Error fetching history:', error);
      this.loading = false;
    });
  }
  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
