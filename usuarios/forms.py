from django import forms
from .models import Usuario

class RegistroUsuarioForm(forms.ModelForm):
    # Additional field to confirm the password
    password = forms.CharField(
        label='Contraseña',
        widget=forms.PasswordInput(attrs={"class": "form-control custom-input"})
    )
    password2 = forms.CharField(
        label='Confirmar Contraseña',
        widget=forms.PasswordInput(attrs={"class": "form-control custom-input"})
    )

    class Meta:
        model = Usuario
        fields = ['nombre', 'email', 'rol']

        # 👇 Añadimos widgets solo para estilo visual
        widgets = {
            'nombre': forms.TextInput(attrs={"class": "form-control custom-input"}),
            'email': forms.EmailInput(attrs={"class": "form-control custom-input"}),
            'rol': forms.Select(attrs={"class": "form-control custom-input"}),
        }

    # Validate that both passwords match
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password2 = cleaned_data.get('password2')

        if password and password2 and password != password2:
            raise forms.ValidationError("Las contraseñas no coinciden.")
        
        return cleaned_data
