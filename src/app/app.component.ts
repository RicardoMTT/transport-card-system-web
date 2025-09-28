import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'balance-card';

  constructor(private router: Router) {}

  goToRecharge() {
    this.router.navigate(['/recharge']);
  }

  goToUse() {
    this.router.navigate(['/use']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
