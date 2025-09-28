import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardService, Card } from '../services/card.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-recharge',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Recargar Tarjeta</h2>
        <p class="text-gray-600">Selecciona tu tarjeta e ingresa el monto a recargar</p>
      </div>

      <form [formGroup]="rechargeForm" (ngSubmit)="onSubmit()" class="max-w-2xl mx-auto">
        <!-- Selección de tarjeta -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Selecciona tu tarjeta</h3>

          <div class="grid gap-4 md:grid-cols-2">
            <div
              *ngFor="let card of cards"
              class="relative"
            >
              <input
                type="radio"
                [id]="'card-' + card.id"
                [value]="card.id"
                formControlName="selectedCard"
                class="sr-only peer"
              >
              <label
                [for]="'card-' + card.id"
                class="flex items-center p-4 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all"
              >
                <div class="flex items-center space-x-3 w-full">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    [style.background-color]="card.color"
                  >
                    {{ card.type === 'metro' ? '🚇' : '🚌' }}
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-800">{{ card.type }}</p>
                    <p class="text-sm text-gray-500">Saldo: S/ {{ card.balance.toFixed(2) }}</p>
                  </div>
                  <!-- <div class="text-blue-600 opacity-0 peer-checked:opacity-100">
                    ✓
                  </div> -->
                </div>
              </label>
            </div>
          </div>

          <div *ngIf="rechargeForm.get('selectedCard')?.errors?.['required'] && rechargeForm.get('selectedCard')?.touched"
               class="text-red-600 text-sm mt-2">
            Por favor selecciona una tarjeta
          </div>
        </div>

        <!-- Monto a recargar -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Monto a recargar</h3>

          <!-- Montos predefinidos -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <button
              *ngFor="let amount of predefinedAmounts"
              type="button"
              class="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-medium"
              [class.border-blue-500]="rechargeForm.get('amount')?.value === amount"
              [class.bg-blue-50]="rechargeForm.get('amount')?.value === amount"
              (click)="selectAmount(amount)"
            >
              S/ {{ amount }}
            </button>
          </div>

          <!-- Monto personalizado -->
           <br>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Monto personalizado
            </label>
            <br>
            <div class="relative">

              <input
                type="number"
                formControlName="amount"
                min="1"
                max="500"
                step="0.50"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.00"
              >
            </div>
            <div *ngIf="rechargeForm.get('amount')?.errors && rechargeForm.get('amount')?.touched"
                 class="text-red-600 text-sm">
              <div *ngIf="rechargeForm.get('amount')?.errors?.['required']">
                El monto es requerido
              </div>
              <div *ngIf="rechargeForm.get('amount')?.errors?.['min']">
                El monto mínimo es S/ 5.00
              </div>
              <div *ngIf="rechargeForm.get('amount')?.errors?.['max']">
                El monto máximo es S/ 500.00
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen -->
        <div *ngIf="getSelectedCard()" class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Resumen de la recarga</h3>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Tarjeta:</span>
              <span class="font-medium">{{ getSelectedCard()?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Saldo actual:</span>
              <span class="font-medium">S/ {{ getSelectedCard()?.balance?.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Monto a recargar:</span>
              <span class="font-medium text-green-600">+ S/ {{ (rechargeForm.get('amount')?.value || 0).toFixed(2) }}</span>
            </div>
            <div class="border-t pt-3 flex justify-between">
              <span class="text-gray-800 font-medium">Saldo final:</span>
              <span class="font-bold text-green-600">
                S/ {{ ((getSelectedCard()?.balance || 0) + (rechargeForm.get('amount')?.value || 0)).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="flex space-x-4">
          <button
            type="submit"
            [disabled]="rechargeForm.invalid || isProcessing"
            class="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <span *ngIf="!isProcessing">💳 Confirmar Recarga</span>
            <span *ngIf="isProcessing">Procesando...</span>
          </button>

          <button
            type="button"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            (click)="resetForm()"
          >
            Limpiar
          </button>
        </div>
      </form>

      <!-- Mensaje de éxito -->
      <div *ngIf="showSuccess" class="max-w-2xl mx-auto">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <div class="text-green-600 text-xl">✅</div>
          <div>
            <p class="text-green-800 font-medium">¡Recarga exitosa!</p>
            <p class="text-green-700 text-sm">Tu tarjeta ha sido recargada correctamente.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RechargeComponent implements OnInit {
  cards$: Observable<Card[]>;
  cards:any;
  rechargeForm: FormGroup;
  predefinedAmounts = [10, 20, 30, 50];
  isProcessing = false;
  showSuccess = false;

  constructor(
    private cardService: CardService,
    private fb: FormBuilder
  ) {
    this.cards$ = this.cardService.cards$;

    this.rechargeForm = this.fb.group({
      selectedCard: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1), Validators.max(500)]]
    });
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

  selectAmount(amount: number) {
    this.rechargeForm.patchValue({ amount });
  }

  getSelectedCard(): Card | undefined {
    const selectedCardId = this.rechargeForm.get('selectedCard')?.value;
    return this.cardService.getCardById(selectedCardId);
  }

  onSubmit() {
    if (this.rechargeForm.valid) {
      this.isProcessing = true;

      const selectedCardId = this.rechargeForm.get('selectedCard')?.value;
      const amount = this.rechargeForm.get('amount')?.value;
      const body = {
        amount: amount
      }
      console.log(selectedCardId);
      console.log(body);

      this.cardService.rechargesCard(selectedCardId, body).subscribe({
        next: (response) => {
          console.log('Recarga exitosa:', response);
            this.isProcessing = false;
            this.showSuccess = true;
            this.resetForm();
            setTimeout(() => {
              this.showSuccess = false;
            }, 3000);
        },
        error: (error) => {
          console.error('Error en la recarga:', error);
          this.isProcessing = false;
        }
      });
      // Simular procesamiento
      // setTimeout(() => {
      //   this.cardService.rechargeCard(selectedCardId, amount);
      //   this.isProcessing = false;
      //   this.showSuccess = true;
      //   this.resetForm();

      //   // Ocultar mensaje de éxito después de 3 segundos
      //   setTimeout(() => {
      //     this.showSuccess = false;
      //   }, 3000);
      // }, 1000);
    }
  }

  resetForm() {
    this.rechargeForm.reset();
  }
}
