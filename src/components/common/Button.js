import React from 'react';

/**
 * Reusable Button component
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button variant ('primary', 'secondary')
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.type='button'] - Button type attribute
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {function} [props.onClick] - Click handler
 * @param {React.ReactNode} [props.iconLeft] - Icon to display before text
 * @param {React.ReactNode} [props.iconRight] - Icon to display after text
 * @param {React.ReactNode} props.children - Button content
 */
const Button = ({
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  iconLeft,
  iconRight,
  children,
  ...rest
}) => {
  // Base class based on variant
  const baseClass = variant === 'primary' ? 'primary-btn' : 'secondary-btn';
  
  // Full class name including additional classes and disabled state
  const buttonClass = `${baseClass} ${disabled ? 'disabled' : ''} ${className}`.trim();
  
  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {iconLeft && <span className="button-icon button-icon-left">{iconLeft}</span>}
      <span className="button-text">{children}</span>
      {iconRight && <span className="button-icon button-icon-right">{iconRight}</span>}
    </button>
  );
};

export default Button;