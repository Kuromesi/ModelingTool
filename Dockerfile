FROM python:3.8

WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt
ENV FLASK_APP=app.py
EXPOSE 4000

# 启动应用
CMD ["python", "app.py"]