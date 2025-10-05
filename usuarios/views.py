from django.shortcuts import render, redirect
from .forms import RegistroUsuarioForm
from .models import Usuario
from artist.models import ArtistProfile
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout

# Registro de usuario
def create_user_account(request):
    next_page = request.GET.get('next')  # Para redirección después del registro
    if request.method == 'POST':
        form = RegistroUsuarioForm(request.POST)
        if form.is_valid():
            usuario = form.save(commit=False)
<<<<<<< HEAD
            usuario.set_password(form.cleaned_data['password'])
            usuario.save()
            # Si el nuevo usuario es un Artista entonces se crea en la base de datos de Artist
            try:
                if usuario.rol == 'Artista':
                    # Crear o get un ArtistProfile con el mismo nombre
                    ArtistProfile.objects.get_or_create(
                        name=usuario.nombre,
                        defaults={
                            'bio': 'Proyecto musical que busca conectar con las emociones y experiencias de la vida a través de sonidos auténticos y letras sinceras. Con un estilo que mezcla influencias de distintos géneros, su propuesta refleja una identidad versátil y en constante evolución',
                            'profile_image': 'artists/profiles/artist_foto.jpg'
                        }
                    )
            except Exception as e:
                messages.warning(request, f"Advertencia al crear perfil de artista: {e}")
            messages.success(request, "User registered successfully.")
            return redirect('login')  # Redirigir al login por si las moscas
=======
            # Guardamos la contraseña hasheada
            usuario.set_password(form.cleaned_data['password'])
            usuario.save()

            # Si el usuario se registró como Artista, crear (o obtener) su perfil
            try:
                if usuario.rol == 'Artista':
                    ArtistProfile.objects.get_or_create(
                        name=usuario.nombre,
                        defaults={
                            'bio': (
                                "Proyecto musical que busca conectar con las emociones y "
                                "experiencias de la vida a través de sonidos auténticos y letras sinceras. "
                                "Con un estilo versátil en constante evolución."
                            ),
                            'profile_image': 'artists/profiles/artist_foto.avif'
                        }
                    )
            except Exception as e:
                # No bloquear el registro por un fallo en creación de perfil, pero avisar
                messages.warning(request, f"Advertencia al crear perfil de artista: {e}")

            messages.success(request, "Usuario registrado con éxito.")
            # Redirige a login respetando next_page
            if next_page:
                return redirect(f"/login/?next={next_page}")
            return redirect('login')
>>>>>>> origin
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