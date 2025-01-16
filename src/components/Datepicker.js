import { addLocale } from 'primereact/api';
import { Calendar } from 'primereact/calendar';

export function Datepicker({ value, onChange, readonly, disabled, removeBtn, className, inputClassName, showOnFocus, minDate, maxDate, showButtonBar, onClearButtonClick }) {
    addLocale('br', {
        firstDayOfWeek: 1,
        dayName: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
        dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
        dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
        monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        today: 'Hoje',
        clear: 'Limpar'
    });
    return (
        <Calendar
            showButtonBar={showButtonBar}
            onClearButtonClick={onClearButtonClick}
            minDate={minDate}
            maxDate={maxDate}
            mask="99/99/9999"
            dateFormat='dd/mm/yy'
            inputClassName={inputClassName}
            locale='br'
            showIcon={!removeBtn}
            readOnlyInput={readonly}
            disabled={disabled}
            onChange={onChange}
            value={value}
            showOnFocus={showOnFocus}
            className={`w-full ${className}`}
        />
    )
}