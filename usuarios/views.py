from django.shortcuts import render, redirect
from .forms import RegistroUsuarioForm
from .models import Usuario
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout

# Registro de usuario
def create_user_account(request):
    next_page = request.GET.get('next')  # Para redirección después del registro
    if request.method == 'POST':
        form = RegistroUsuarioForm(request.POST)
        if form.is_valid():
            usuario = form.save(commit=False)
            # Guardamos la contraseña hasheada
            usuario.set_password(form.cleaned_data['password'])
            usuario.save()
            messages.success(request, "Usuario registrado con éxito.")
            # Redirige a login respetando next_page
            if next_page:
                return redirect(f"/login/?next={next_page}")
            return redirect('login')
    else:
        form = RegistroUsuarioForm()

    return render(request, 'usuarios/registro.html', {'form': form, 'next': next_page})

# Login de usuario
def login_user(request):
    next_page = request.GET.get('next') or request.POST.get('next')
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f"¡Bienvenid@ de nuevo, {user.email}!")
            return redirect(next_page if next_page else 'home')
        else:
            messages.error(request, 'Email o contraseña inválidos.')

    return render(request, 'usuarios/login.html', {'next': next_page})

# Página de inicio
def home(request):
    return render(request, 'usuarios/home.html')

# Logout
def logout_user(request):
    logout(request)
    storage = messages.get_messages(request)
    for _ in storage:
        pass  # iterar para vaciar mensajes antiguos

    messages.success(request, "Has cerrado sesión correctamente.")
    return redirect('login')


