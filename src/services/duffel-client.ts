import { Duffel } from '@duffel/api';

// On initialise le client avec le token stocké dans tes variables d'environnement
export const duffel = new Duffel({
    token: process.env.DUFFEL_ACCESS_TOKEN as string,
});