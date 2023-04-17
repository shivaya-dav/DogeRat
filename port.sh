#!/usr/bin/env bash
if ! command -v ssh > /dev/null; then
    echo "Error: openssh is not installed. Please install it before running this script."
    exit 1
fi

echo -e "\e[1;32m"
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo " ____  ____  ____   ___  ____  ____  ____   __"
echo "||d ||||o ||||g || ||e ||||r ||||a ||||t ||||\ "
echo "||__||||__||||__||||__||||__||||__||||__||||_\\"
echo "|\__/|\__/|\__/||/__/|\__/|\__/|\__/|\__/|\__/"
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo -e "\e[0m"
echo "Author: shivayadv"
echo "Github: shivaya-dav"
echo "Telegram channel: cybershieldx"
read -p "Enter your Telegram username: " telegram_username
sed -i "0,/telegram_username/s//${telegram_username}/" port.sh
ssh -R ${telegram_username}:80:localhost:8999 -o GatewayPorts=no serveo.net
