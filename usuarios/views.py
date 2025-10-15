from django.shortcuts import render, redirect
from .forms import RegistroUsuarioForm
from .models import Usuario
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

def create_user_account(request):   #create_user_account
    if request.method == 'POST':
        form = RegistroUsuarioForm(request.POST)
        if form.is_valid():
            # Create the user but don't save yet
            usuario = form.save(commit=False)
            # Set the hashed password using set_password
            usuario.set_password(form.cleaned_data['password'])
            usuario.save()
            messages.success(request, "User registered successfully.")
            return redirect('login')  # Redirect to login view
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


