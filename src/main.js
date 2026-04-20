window.onload = function() {
    const loginForm = document.getElementById('loginForm');
    const globalError = document.getElementById('errorMessage');

    //règles de validation
    const validationRules = {
        identifiant: {
            required: true,
            messages: {
                required: "L'identifiant est obligatoire"
            }
        },
        password: {
            required: true,
            messages: {
                required: "Le mot de passe est obligatoire"
            }
        }
    };

    // 2. Utilisateurs autorisés
    const users = [
        { login: 'admin', password: 'admin123' },
        { login: 'alice', password: 'alice456' }
    ];

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isFormValid = true;
        
        globalError.classList.add('hidden');

        for (let fieldId in validationRules) {
            const input = document.getElementById(fieldId);
            const errorSpan = document.getElementById(`error-${fieldId}`);
            const rules = validationRules[fieldId];

            input.classList.remove('border-red-500', 'bg-red-5');
            if (errorSpan) errorSpan.classList.add('hidden');

            if (rules.required && input.value.trim() === "") {
                if (errorSpan) {
                    errorSpan.textContent = rules.messages.required;
                    errorSpan.classList.remove('hidden');
                }
                input.classList.add('border-red-500', 'bg-red-5');
                isFormValid = false;
            }
        }

        if (isFormValid) {
            const userVal = document.getElementById('identifiant').value;
            const passVal = document.getElementById('password').value;

            const found = users.find(u => u.login === userVal && u.password === passVal);

            if (found) {
                window.location.href = "accueil.html";
            } else {
                globalError.classList.remove('hidden');
                document.getElementById('identifiant').classList.add('border-red-500');
                document.getElementById('password').classList.add('border-red-500');
            }
        }
    });
};