import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './shared/layout/footer/footer';
import { Header } from './shared/layout/header/header';
import { Loader } from './shared/ui/feedback/loader/loader';
import { Notifications } from './shared/ui/feedback/notifications/notifications';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Header, Loader, Notifications],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
