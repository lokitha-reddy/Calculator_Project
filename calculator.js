
class ScientificCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.shiftIndicator = document.getElementById('shift-indicator');
        this.offOverlay = document.getElementById('offOverlay');
        this.calculator = document.getElementById('calculator');
        
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.isOn = false;
        this.isShiftMode = false;
        
        this.turnOff();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add click event to turn on calculator when off
        this.offOverlay.addEventListener('click', () => this.turnOn());
        
        // Add keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    turnOn() {
        this.isOn = true;
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.isShiftMode = false;
        
        this.offOverlay.classList.remove('active');
        this.calculator.classList.remove('shift-mode');
        this.shiftIndicator.classList.add('hidden');
        this.updateDisplay();
    }
    
    turnOff() {
        this.isOn = false;
        this.currentValue = 'Calculator Off';
        this.offOverlay.classList.add('active');
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.display.textContent = this.currentValue || '0';
    }
    
    inputNumber(num) {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        if (this.waitingForOperand) {
            this.currentValue = num;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        
        this.updateDisplay();
    }
    
    inputCharacter(char) {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        this.currentValue = this.currentValue === '0' ? char : this.currentValue + char;
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        
        this.updateDisplay();
    }
    
    performOperation(nextOperation) {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousValue || 0;
            const result = this.evaluateExpression(currentValue, inputValue, this.operation);
            
            this.currentValue = this.formatNumber(result);
            this.previousValue = result;
        }
        
        this.waitingForOperand = true;
        this.operation = nextOperation;
        this.updateDisplay();
    }
    
    calculate() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        if (this.previousValue !== null && this.operation) {
            const inputValue = parseFloat(this.currentValue);
            const result = this.evaluateExpression(this.previousValue, inputValue, this.operation);
            
            this.currentValue = this.formatNumber(result);
            this.previousValue = null;
            this.operation = null;
            this.waitingForOperand = true;
            this.updateDisplay();
        }
    }
    
    evaluateExpression(firstNumber, secondNumber, operation) {
        switch (operation) {
            case '+':
                return firstNumber + secondNumber;
            case '-':
                return firstNumber - secondNumber;
            case '*':
                return firstNumber * secondNumber;
            case '/':
                return secondNumber !== 0 ? firstNumber / secondNumber : 0;
            case '%':
                return secondNumber !== 0 ? firstNumber % secondNumber : 0;
            default:
                return secondNumber;
        }
    }
    
    performSquare() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        const inputValue = parseFloat(this.currentValue);
        const result = inputValue * inputValue;
        
        this.currentValue = this.formatNumber(result);
        this.waitingForOperand = true;
        this.updateDisplay();
    }
    
    performFunction(func) {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        const inputValue = parseFloat(this.currentValue);
        let result = inputValue;
        
        switch (func) {
            case 'sin':
                result = this.isShiftMode 
                    ? Math.asin(inputValue) * (180 / Math.PI)
                    : Math.sin(inputValue * (Math.PI / 180));
                break;
            case 'cos':
                result = this.isShiftMode 
                    ? Math.acos(inputValue) * (180 / Math.PI)
                    : Math.cos(inputValue * (Math.PI / 180));
                break;
            case 'tan':
                result = this.isShiftMode 
                    ? Math.atan(inputValue) * (180 / Math.PI)
                    : Math.tan(inputValue * (Math.PI / 180));
                break;
            case 'log':
                result = this.isShiftMode ? Math.pow(10, inputValue) : Math.log10(inputValue);
                break;
            case 'ln':
                result = this.isShiftMode ? Math.exp(inputValue) : Math.log(inputValue);
                break;
            case 'sqrt':
                result = this.isShiftMode ? inputValue * inputValue : Math.sqrt(inputValue);
                break;
            case 'x-1':
                result = this.isShiftMode ? this.factorial(inputValue) : 1 / inputValue;
                break;
            case 'x3':
                result = this.isShiftMode ? Math.pow(inputValue, 1/3) : Math.pow(inputValue, 3);
                break;
            case 'xy':
                result = Math.pow(inputValue, 2);
                break;
            case 'x10':
                result = inputValue * Math.pow(10, 1);
                break;
            case '(-)':
                result = -inputValue;
                break;
            default:
                // For functions not implemented, just return the input
                result = inputValue;
                break;
        }
        
        this.currentValue = this.formatNumber(result);
        this.waitingForOperand = true;
        this.updateDisplay();
    }
    
    factorial(n) {
        if (n < 0) return 0;
        if (n === 0 || n === 1) return 1;
        if (n > 170) return Infinity;
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    formatNumber(value) {
        // Handle very large numbers with scientific notation
        if (Math.abs(value) > 999999999) {
            return value.toExponential(3);
        }
        
        // Handle decimal precision - remove trailing zeros
        if (value % 1 !== 0) {
            const formatted = parseFloat(value.toFixed(8)).toString();
            return formatted;
        }
        
        // Return whole numbers as is
        return value.toString();
    }
    
    toggleShift() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        this.isShiftMode = !this.isShiftMode;
        
        if (this.isShiftMode) {
            this.calculator.classList.add('shift-mode');
            this.shiftIndicator.classList.remove('hidden');
            document.querySelector('.shift-btn').classList.add('active');
        } else {
            this.calculator.classList.remove('shift-mode');
            this.shiftIndicator.classList.add('hidden');
            document.querySelector('.shift-btn').classList.remove('active');
        }
    }
    
    clearEntry() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        this.currentValue = '0';
        this.updateDisplay();
    }
    
    allClear() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.isShiftMode = false;
        this.calculator.classList.remove('shift-mode');
        this.shiftIndicator.classList.add('hidden');
        document.querySelector('.shift-btn').classList.remove('active');
        this.updateDisplay();
    }
    
    handleKeyboard(e) {
        if (!this.isOn) return;
        
        const key = e.key;
        
        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
        } else if (key === '.') {
            this.inputDecimal();
        } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') {
            this.performOperation(key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (key === 'Escape') {
            this.allClear();
        } else if (key === 'Backspace') {
            this.clearEntry();
        }
    }
}

// Initialize calculator
const calculator = new ScientificCalculator();

// Global functions for HTML onclick events
function inputNumber(num) {
    calculator.inputNumber(num);
}

function inputCharacter(char) {
    calculator.inputCharacter(char);
}

function inputDecimal() {
    calculator.inputDecimal();
}

function performOperation(op) {
    calculator.performOperation(op);
}

function calculate() {
    calculator.calculate();
}

function performSquare() {
    calculator.performSquare();
}

function performFunction(func) {
    calculator.performFunction(func);
}

function toggleShift() {
    calculator.toggleShift();
}

function clearEntry() {
    calculator.clearEntry();
}

function allClear() {
    calculator.allClear();
}

function turnOff() {
    calculator.turnOff();
}
