import express from 'express';
import { app } from '../app';

// Ce fichier est utilisé pour les tests
export const createTestServer = () => {
  return app;
};