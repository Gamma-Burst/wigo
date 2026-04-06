import { Duffel } from '@duffel/api';

// On initialise le client avec le token stocké dans les variables d'environnement
export const duffel = new Duffel({
    token: process.env.DUFFEL_API_KEY as string,
});