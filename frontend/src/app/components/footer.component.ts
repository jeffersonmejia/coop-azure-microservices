import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <span class="footer-brand">Cooperativa Ecuador &copy; {{ year }}</span>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      min-height: var(--coop-footer-height);
      padding: 0 24px;
      box-sizing: border-box;
      text-align: center;
      background: rgb(255 255 255 / 72%);
    }

    .footer-content {
      display: flex;
      min-height: calc(var(--coop-footer-height) - 1px);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-family: var(--coop-font);
      font-size: 13px;
      color: var(--coop-text-muted);
    }

    .footer-brand {
      font-weight: 500;
      color: var(--coop-text-muted);
    }

  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
