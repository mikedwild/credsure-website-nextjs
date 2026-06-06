"use client";
import React from 'react';
import { HeartPulse } from 'lucide-react';
import { SolutionPageTemplate } from './SolutionPageTemplate';

export const Healthcare = () => (
  <SolutionPageTemplate solutionKey="healthcare" canonical="/solutions/healthcare" Icon={HeartPulse} />
);
