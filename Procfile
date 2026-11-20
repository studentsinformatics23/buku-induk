web: cd backend && python manage.py migrate && python manage.py init_users && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
