import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface FloatingInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: LucideIcon;
  required?: boolean;
}

export function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  icon: Icon,
  required = false
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className="relative">
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
        )}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className={`
            w-full px-4 py-4 ${Icon ? 'pl-12' : ''} ${isPasswordField ? 'pr-12' : ''}
            bg-white/10 dark:bg-white/5
            backdrop-blur-xl
            border-2 rounded-xl
            text-gray-900 dark:text-white
            placeholder-transparent
            transition-all duration-300
            focus:outline-none
            ${error 
              ? 'border-red-500/50 focus:border-red-500' 
              : isFocused || value
                ? 'border-purple-500/50 focus:border-purple-500'
                : 'border-white/20 dark:border-white/10'
            }
          `}
          placeholder={label}
        />
        <motion.label
          initial={false}
          animate={{
            top: isFocused || value ? '-0.75rem' : '50%',
            scale: isFocused || value ? 0.85 : 1,
            y: isFocused || value ? 0 : -8,
          }}
          className={`
            absolute left-4 ${Icon ? 'left-12' : 'left-4'}
            px-2 pointer-events-none
            bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800
            rounded
            transition-colors duration-300
            ${error 
              ? 'text-red-500' 
              : isFocused 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-gray-500 dark:text-gray-400'
            }
          `}
        >
          {label}
        </motion.label>
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
