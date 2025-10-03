from django.shortcuts import render, redirect
from .forms import RegistroUsuarioForm
from .models import Usuario
from artist.models import ArtistProfile
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

def create_user_account(request):   #create_user_account
    if request.method == 'POST':
        form = RegistroUsuarioForm(request.POST)
        if form.is_valid():
            usuario = form.save(commit=False)
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
    else:
        form = RegistroUsuarioForm()

    return render(request, 'usuarios/registro.html', {'form': form})

def login_user(request):  # login_user
    # If the user submits the form
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Try to authenticate the user
        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')  # Redirect to a protected page after login
        else:
            messages.error(request, 'Invalid email or password.')

    # Render the login form
    return render(request, 'usuarios/login.html')

def home(request):   #show_home_page
    # Show the home page after login or just as a landing page
    return render(request, 'usuarios/home.html')

def logout_user(request):  #logout_user
    logout(request)
    storage = messages.get_messages(request)
    for _ in storage:
        pass  # iterar para vaciar

    # Ahora sí, mostrar solo el mensaje de logout
    messages.success(request, "You have been logged out.")
    return redirect('login')


