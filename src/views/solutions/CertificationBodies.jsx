"use client";
import React from 'react';
import { Stethoscope } from 'lucide-react';
import { SolutionPageTemplate } from './SolutionPageTemplate';

export const CertificationBodies = () => (
  <SolutionPageTemplate solutionKey="certificationBodies" canonical="/solutions/certification-bodies" Icon={Stethoscope} />
);
