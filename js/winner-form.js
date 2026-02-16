// טעינת רשימת הסניפים
document.addEventListener('DOMContentLoaded', function() {
    loadBranches();
    initializeForm();
});

async function loadBranches() {
    try {
        const response = await fetchFromAPI('getBranches');
        
        if (response && response.data) {
            const branchSelect = document.getElementById('branch');
            if (branchSelect) {
                branchSelect.innerHTML = '<option value="">בחר סניף</option>';
                
                response.data.forEach(branch => {
                    const option = document.createElement('option');
                    option.value = branch;
                    option.textContent = branch;
                    branchSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('שגיאה בטעינת סניפים:', error);
        showError('שגיאה בטעינת רשימת הסניפים');
    }
}

function initializeForm() {
    const form = document.getElementById('winnerForm');
    if (!form) return;
    
    const idInput = document.getElementById('idNumber');
    const phoneInput = document.getElementById('phone');
    const parentPhoneInput = document.getElementById('parentPhone');
    const accountNumberInput = document.getElementById('accountNumber');

    // תיקוף תעודת זהות - רק ספרות, מקסימום 9
    if (idInput) {
        idInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
        });
        
        idInput.addEventListener('blur', function() {
            if (this.value && this.value.length !== 9) {
                this.setCustomValidity('מספר תעודת זהות חייב להכיל 9 ספרות');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // תיקוף טלפון - פורמט אוטומטי
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/[^0-9]/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    this.value = value;
                } else if (value.length <= 6) {
                    this.value = value.replace(/(\d{3})(\d+)/, '$1-$2');
                } else {
                    this.value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
                }
            }
        });
        
        phoneInput.addEventListener('blur', function() {
            const digits = this.value.replace(/[^0-9]/g, '');
            if (digits.length < 9 || digits.length > 10 || !digits.startsWith('0')) {
                this.setCustomValidity('מספר טלפון אינו תקין');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // תיקוף טלפון הורה - פורמט אוטומטי
    if (parentPhoneInput) {
        parentPhoneInput.addEventListener('input', function() {
            let value = this.value.replace(/[^0-9]/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    this.value = value;
                } else if (value.length <= 6) {
                    this.value = value.replace(/(\d{3})(\d+)/, '$1-$2');
                } else {
                    this.value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
                }
            }
        });
        
        parentPhoneInput.addEventListener('blur', function() {
            const digits = this.value.replace(/[^0-9]/g, '');
            if (digits.length < 9 || digits.length > 10 || !digits.startsWith('0')) {
                this.setCustomValidity('מספר טלפון אינו תקין');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // תיקוף מספר חשבון - רק ספרות
    if (accountNumberInput) {
        accountNumberInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // טיפול בשליחת הטופס
    form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // תיקוף נתונים
    if (!validateForm(data)) {
        return;
    }

    showLoading(true);
    
    try {
        const response = await fetchFromAPI('submitWinnerForm', 'GET', {
            winnerDetails: data
        });
        
        if (response && response.success) {
            showSuccess();
            event.target.reset();
        } else {
            showError(response?.error || 'שגיאה בשליחת הטופס');
        }
    } catch (error) {
        console.error('שגיאה בשליחת טופס זכייה:', error);
        showError('שגיאה בהתחברות לשרת. אנא נסה שוב.');
    } finally {
        showLoading(false);
    }
}

function validateForm(data) {
    // בדיקת תעודת זהות
    if (!data.idNumber || !/^\d{9}$/.test(data.idNumber)) {
        showError('מספר תעודת הזהות חייב להכיל בדיוק 9 ספרות');
        return false;
    }
    
    // בדיקת טלפון זוכה
    const phoneDigits = data.phone?.replace(/[^0-9]/g, '') || '';
    if (!phoneDigits || phoneDigits.length < 9 || phoneDigits.length > 10 || !phoneDigits.startsWith('0')) {
        showError('מספר הטלפון של הזוכה אינו תקין');
        return false;
    }
    
    // בדיקת טלפון הורה
    const parentPhoneDigits = data.parentPhone?.replace(/[^0-9]/g, '') || '';
    if (!parentPhoneDigits || parentPhoneDigits.length < 9 || parentPhoneDigits.length > 10 || !parentPhoneDigits.startsWith('0')) {
        showError('מספר הטלפון של ההורה אינו תקין');
        return false;
    }
    
    // בדיקת מספר חשבון
    if (!data.accountNumber || !/^\d+$/.test(data.accountNumber)) {
        showError('מספר חשבון הבנק אינו תקין');
        return false;
    }
    
    return true;
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.toggle('hidden', !show);
    }
}

function showSuccess() {
    const success = document.getElementById('successMessage');
    const error = document.getElementById('errorMessage');
    const form = document.getElementById('winnerForm');
    
    if (success) success.classList.remove('hidden');
    if (error) error.classList.add('hidden');
    if (form) form.classList.add('hidden');
    
    // גלילה לתוצאה
    if (success) {
        setTimeout(() => {
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

function showError(message) {
    const error = document.getElementById('errorMessage');
    const success = document.getElementById('successMessage');
    const errorText = document.getElementById('errorText');
    const form = document.getElementById('winnerForm');
    
    if (errorText) errorText.textContent = message;
    if (error) error.classList.remove('hidden');
    if (success) success.classList.add('hidden');
    if (form) form.classList.remove('hidden');
    
    // גלילה לשגיאה
    if (error) {
        setTimeout(() => {
            error.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
    
    // הסתרת השגיאה אחרי 5 שניות
    setTimeout(() => {
        if (error) error.classList.add('hidden');
    }, 5000);
} 