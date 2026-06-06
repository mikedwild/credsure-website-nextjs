"use client";
import React from 'react';
import { Privacy } from './Privacy';

/**
 * /privacy-policy serves the exact same authoritative privacy policy as
 * /privacy. Keeping it as a thin re-export so both URLs (kept for legacy
 * inbound links) stay in sync with the heyData-sourced source of truth
 * stored in /public/locales/{en,de}/legal.json.
 */
export const PrivacyPolicy = Privacy;

export default PrivacyPolicy;
