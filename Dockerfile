FROM python:3.9-bullseye
ENV PYTHONUNBUFERRED=1
RUN apt-get -qq update
RUN apt-get install --yes apache2 apache2-dev libapache2-mod-wsgi-py3 python3-virtualenv
RUN a2enmod wsgi
RUN a2enmod status
WORKDIR /code
COPY requirements.txt /code/
RUN pip install mod_wsgi
RUN pip install -r requirements.txt
ADD ./apache/000-default.conf /etc/apache2/sites-available/000-default.conf
ADD ./apache/status.conf /etc/apache2/mods-available/status.conf
EXPOSE 80
COPY . /code/
RUN useradd iotuser && chown -R iotuser /code
CMD ["apache2ctl","-D","FOREGROUND"]
