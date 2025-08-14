from django import forms
from .models import Usuario

class RegistroUsuarioForm(forms.ModelForm):
    # Additional field to confirm the password
    password = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput)

    class Meta:
        model = Usuario
        fields = ['nombre', 'email', 'rol']

    # Validate that both passwords match
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password2 = cleaned_data.get('password2')

        if password and password2 and password != password2:
            raise forms.ValidationError("Passwords do not match")
        
        return cleaned_data
