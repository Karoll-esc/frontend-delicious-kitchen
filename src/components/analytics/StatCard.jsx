import PropTypes from 'prop-types';

/**
 * Componente reutilizable para tarjetas de estadísticas
 * Muestra métricas individuales con título, valor y variación porcentual
 * HU-022: Soporte para variantes warning y danger para métricas de cancelados
 */
function StatCard({ title, value, change, isPositive = true, icon, format = 'number', variant = 'default' }) {
  const formattedValue = formatValue(value, format);
  const changeColor = isPositive ? 'text-[#078829] dark:text-green-400' : 'text-[#e72a08] dark:text-red-400';
  
  // HU-022: Colores dinámicos según variante
  const variantStyles = {
    default: {
      border: 'border-gray-200 dark:border-gray-800',
      iconColor: 'text-primary',
      bg: 'bg-white dark:bg-background-dark/50'
    },
    warning: {
      border: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/10'
    },
    danger: {
      border: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-500 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/10'
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;
  
  return (
    <div className={`flex flex-col gap-2 rounded-xl p-6 border ${styles.border} ${styles.bg} hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <p className="text-[#63886f] dark:text-gray-400 text-base font-medium leading-normal">
          {title}
        </p>
        {icon && (
          <span className={`material-symbols-outlined text-2xl ${styles.iconColor}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="text-[#111813] dark:text-white tracking-light text-3xl font-bold leading-tight">
        {formattedValue}
      </p>
      {change !== null && change !== undefined && (
        <p className={`${changeColor} text-base font-medium leading-normal`}>
          {isPositive ? '+' : ''}{change}%
        </p>
      )}
      {change === null && (
        <p className="text-transparent text-base font-medium leading-normal">.</p>
      )}
    </div>
  );
}

/**
 * Formatea valores según el tipo especificado
 */
function formatValue(value, format) {
  if (value === null || value === undefined) return 'N/A';
  
  switch (format) {
    case 'currency':
      return `$${Number(value).toLocaleString('es-CO')}`;
    case 'number':
      return Number(value).toLocaleString('es-CO');
    case 'time':
      return `${value} min`;
    case 'text':
    default:
      return value;
  }
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  change: PropTypes.number,
  isPositive: PropTypes.bool,
  icon: PropTypes.string,
  format: PropTypes.oneOf(['number', 'currency', 'time', 'text']),
  variant: PropTypes.oneOf(['default', 'warning', 'danger']) // HU-022: Nueva prop
};

export default StatCard;
