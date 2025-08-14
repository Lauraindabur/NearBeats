from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

class UsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ['email', 'nombre', 'rol', 'is_staff']
    ordering = ['email']  # ✅ usamos 'email' en lugar de 'username'

    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('nombre', 'rol')}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('nombre', 'rol')}),
    )

admin.site.register(Usuario, UsuarioAdmin)
