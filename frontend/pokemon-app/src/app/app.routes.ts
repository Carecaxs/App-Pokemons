import { Routes } from '@angular/router';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';
import { PokemonDetailComponent } from './pokemon-detail/pokemon-detail.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './services/auth.guard';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'pokemon/register',
    component: RegisterComponent,
  },
  {
    path: 'pokemon/all',
    component: PokemonListComponent,
    data: { mode: 'allPokemons' },
    canActivate: [AuthGuard],
  },
  {
    path: 'pokemon/own',
    component: PokemonListComponent,
    data: { mode: 'myPokemons' },
    canActivate: [AuthGuard],
  },
  {
    path: 'pokemon/all/:id',
    component: PokemonDetailComponent,
    data: { mode: 'allPokemons' },
    canActivate: [AuthGuard],
  },
  {
    path: 'pokemon/own/:id',
    component: PokemonDetailComponent,
    data: { mode: 'myPokemons' },
    canActivate: [AuthGuard],
  },
];
