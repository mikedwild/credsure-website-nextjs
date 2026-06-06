"use client";
import { Button } from './button';

export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

// Default button
export const Default = {
  args: {
    children: 'Button',
  },
};

// Primary CTA (Brand Purple)
export const PrimaryCTA = {
  args: {
    children: 'Book a Demo',
    className: 'bg-brand-purple hover:bg-[#3F2BD9] text-white',
  },
};

// Outline variant
export const Outline = {
  args: {
    variant: 'outline',
    children: 'Learn More',
  },
};

// Secondary variant
export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Secondary Action',
  },
};

// Ghost variant
export const Ghost = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

// Small size
export const Small = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

// Large size
export const Large = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

// With icon
export const WithIcon = {
  args: {
    children: (
      <>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add New
      </>
    ),
    className: 'bg-brand-purple hover:bg-[#3F2BD9] text-white',
  },
};

// Disabled state
export const Disabled = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

// Loading state
export const Loading = {
  args: {
    disabled: true,
    children: (
      <>
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </>
    ),
    className: 'bg-brand-purple',
  },
};

// Full width
export const FullWidth = {
  args: {
    children: 'Full Width Button',
    className: 'w-full bg-brand-purple hover:bg-[#3F2BD9] text-white',
  },
  parameters: {
    layout: 'padded',
  },
};
