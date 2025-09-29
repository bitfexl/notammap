./build-images.sh

podman quadlet install systemd/quadlets

ln -s $(pwd)/systemd/notammap-notamextractor.timer /etc/systemd/system

systemctl daemon-reload

systemctl start notammap-webserver.service

systemctl enable notammap-notamextractor.timer
systemctl start notammap-notamextractor.timer