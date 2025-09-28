import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Card, CardService } from '../services/card.service';

@Component({
  selector: 'app-use',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Usar Tarjeta</h2>
        <p class="text-gray-600">Registra tu viaje y el número de pasajeros</p>
      </div>

      <form [formGroup]="useForm" (ngSubmit)="onSubmit()" class="max-w-2xl mx-auto">
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
                [class.opacity-50]="!canUseCard(card)"
                [class.cursor-not-allowed]="!canUseCard(card)"
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
                    <p class="text-sm" [class]="getBalanceClass(card.balance)">
                      Saldo: S/ {{ card.balance.toFixed(2) }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Tarifa: S/ {{ card.fare.toFixed(2) }} por persona
                    </p>
                  </div>
                  <!-- <div class="text-blue-600 opacity-0 peer-checked:opacity-100">
                    ✓
                  </div> -->
                </div>
              </label>

              <!-- <div *ngIf="!canUseCard(card)" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                <span class="text-red-600 font-medium text-sm">Saldo insuficiente</span>
              </div> -->
            </div>
          </div>

          <div *ngIf="useForm.get('selectedCard')?.errors?.['required'] && useForm.get('selectedCard')?.touched"
               class="text-red-600 text-sm mt-2">
            Por favor selecciona una tarjeta
          </div>
        </div>

        <!-- Número de pasajeros -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">¿Cuántas personas van a viajar?</h3>

          <!-- Selector visual de pasajeros -->
          <div class="grid grid-cols-4 md:grid-cols-8 gap-3 mb-4">
            <button
              *ngFor="let num of passengerOptions"
              type="button"
              style="display: flex;align-items: center;justify-content: center;"
              class="aspect-square p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-medium flex items-center justify-center"
              [class.border-blue-500]="useForm.get('passengers')?.value === num"
              [class.bg-blue-50]="useForm.get('passengers')?.value === num"
              [class.text-blue-600]="useForm.get('passengers')?.value === num"
              (click)="selectPassengers(num)"
            >
              {{ num }}
            </button>
          </div>

          <!-- Input personalizado -->
          <!-- <div class="space-y-2">
            <br>
            <label class="block text-sm font-medium text-gray-700">
              Número personalizado (máximo 10)
            </label>
            <br>
            <input
              type="number"
              formControlName="passengers"
              min="1"
              max="10"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Número de pasajeros"
            >
            <div *ngIf="useForm.get('passengers')?.errors && useForm.get('passengers')?.touched"
                 class="text-red-600 text-sm">
              <div *ngIf="useForm.get('passengers')?.errors?.['required']">
                El número de pasajeros es requerido
              </div>
              <div *ngIf="useForm.get('passengers')?.errors?.['min']">
                Mínimo 1 pasajero
              </div>
              <div *ngIf="useForm.get('passengers')?.errors?.['max']">
                Máximo 10 pasajeros
              </div>
            </div>
          </div> -->
        </div>

        <!-- Calculadora de costo -->
        <div *ngIf="getSelectedCard() && useForm.get('passengers')?.value" class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Cálculo del viaje</h3>

          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Tarjeta:</span>
              <span class="font-medium">{{ getSelectedCard()?.name }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Tarifa por persona:</span>
              <span class="font-medium">S/ {{ getSelectedCard()?.farePrice?.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Número de pasajeros:</span>
              <span class="font-medium">{{ useForm.get('passengers')?.value }}</span>
            </div>
            <div class="border-t pt-3 flex justify-between items-center">
              <span class="text-gray-800 font-medium">Costo total:</span>
              <span class="font-bold text-blue-600 text-lg">
                S/ {{ getTotalCost().toFixed(2) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Saldo actual:</span>
              <span class="font-medium" [class]="getBalanceClass(getSelectedCard()?.balance || 0)">
                S/ {{ getSelectedCard()?.balance?.toFixed(2) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Saldo después del viaje:</span>
              <span class="font-medium" [class]="getBalanceClass(getRemainingBalance())">
                S/ {{ getRemainingBalance().toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Advertencia de saldo bajo -->
          <div *ngIf="getRemainingBalance() < 5" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <span class="text-yellow-600">⚠️</span>
              <span class="text-yellow-800 text-sm font-medium">
                Advertencia: Tu saldo quedará bajo después de este viaje
              </span>
            </div>
          </div>

          <!-- Error de saldo insuficiente -->
          <div *ngIf="!canAffordTrip()" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <span class="text-red-600">❌</span>
              <span class="text-red-800 text-sm font-medium">
                Saldo insuficiente para este viaje
              </span>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex space-x-4">
          <button
            type="submit"
            [disabled]="useForm.invalid || isProcessing || !canAffordTrip()"
            class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <span *ngIf="!isProcessing">🚇 Confirmar Viaje</span>
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
            <p class="text-green-800 font-medium">¡Viaje registrado exitosamente!</p>
            <p class="text-green-700 text-sm">Se ha descontado S/ {{ lastTransactionAmount.toFixed(2) }} de tu tarjeta.</p>
          </div>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div *ngIf="showError" class="max-w-2xl mx-auto">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <div class="text-red-600 text-xl">❌</div>
          <div>
            <p class="text-red-800 font-medium">Error al procesar el viaje</p>
            <p class="text-red-700 text-sm">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UseComponent implements OnInit {
  cards$: Observable<Card[]>;
  useForm: FormGroup;
  passengerOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  isProcessing = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';
  lastTransactionAmount = 0;
  cards: any;

  constructor(
    private cardService: CardService,
    private fb: FormBuilder
  ) {
    this.cards$ = this.cardService.cards$;

    this.useForm = this.fb.group({
      selectedCard: ['', Validators.required],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
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

  selectPassengers(num: number) {
    this.useForm.patchValue({ passengers: num });
  }

  getSelectedCard(): any | undefined {
    const selectedCardId = this.useForm.get('selectedCard')?.value;
    return this.cardService.getCardById(selectedCardId);
  }

  canUseCard(card: any): boolean {
    return card.balance >= card.fare;
  }

  getTotalCost(): number {
    const card = this.getSelectedCard();
    const passengers = this.useForm.get('passengers')?.value || 0;
    return card ? card.fare * passengers : 0;
  }

  getRemainingBalance(): number {
    const card = this.getSelectedCard();
    const totalCost = this.getTotalCost();
    return card ? card.balance - totalCost : 0;
  }

  canAffordTrip(): boolean {
    return this.getRemainingBalance() >= 0;
  }

  getBalanceClass(balance: number): string {
    if (balance < 0) return 'text-red-600';
    if (balance <= 5) return 'text-red-600';
    if (balance <= 15) return 'text-yellow-600';
    return 'text-green-600';
  }

  onSubmit() {
    if (this.useForm.valid && this.canAffordTrip()) {
      this.isProcessing = true;
      this.showError = false;

      const selectedCardId = this.useForm.get('selectedCard')?.value;
      const passengers = this.useForm.get('passengers')?.value;

      const body={
        passengers: passengers
      }
      this.cardService.usagesCard(selectedCardId, body).subscribe({
        next: (response) => {
          console.log('Viaje registrado exitosamente:', response);
            this.resetForm();
           this.showSuccess = true;
            setTimeout(() => {
            this.showSuccess = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Error en el registro del viaje:', error);
          this.showError = true;
          this.errorMessage = 'Saldo insuficiente para completar el viaje';

          // Ocultar mensaje de error después de 3 segundos
          setTimeout(() => {
            this.showError = false;
          }, 3000);
        }
      });

      // Simular procesamiento
      // setTimeout(() => {
      //   const success = this.cardService.useCard(selectedCardId, passengers);
      //   this.isProcessing = false;

      //   if (success) {
      //     this.lastTransactionAmount = this.getTotalCost();
      //     this.showSuccess = true;
      //     this.resetForm();

      //     // Ocultar mensaje de éxito después de 3 segundos
      //     setTimeout(() => {
      //       this.showSuccess = false;
      //     }, 3000);
      //   } else {
      //     this.showError = true;
      //     this.errorMessage = 'Saldo insuficiente para completar el viaje';

      //     // Ocultar mensaje de error después de 3 segundos
      //     setTimeout(() => {
      //       this.showError = false;
      //     }, 3000);
      //   }
      // }, 1000);
    }
  }

  resetForm() {
    this.useForm.reset({
      passengers: 1
    });
  }
}
