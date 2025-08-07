from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

# Custom manager to handle user creation
class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre, rol, password=None):
        if not email:
            raise ValueError("Users must have an email address")
        if not rol:
            raise ValueError("Users must have a role")

        email = self.normalize_email(email)
        user = self.model(email=email, nombre=nombre, rol=rol)
        user.set_password(password)  # hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nombre, rol, password=None):
        user = self.create_user(email, nombre, rol, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

# Custom user model
class Usuario(AbstractBaseUser, PermissionsMixin):
    ROLES = (
        ('Artista', 'Artista'),
        ('Oyente', 'Oyente'),
    )

    email = models.EmailField(unique=True)             # User's email (unique identifier)
    nombre = models.CharField(max_length=100)          # User's name
    rol = models.CharField(max_length=10, choices=ROLES)  # User role: Artista or Oyente
    is_active = models.BooleanField(default=True)      # Can the user log in?
    is_staff = models.BooleanField(default=False)      # Can access Django admin?

    objects = UsuarioManager()                         # Link to custom manager

    USERNAME_FIELD = 'email'                           # Use email as login identifier
    REQUIRED_FIELDS = ['nombre', 'rol']                # Fields required when creating a superuser

    def __str__(self):
        return f"{self.nombre} ({self.rol})"
