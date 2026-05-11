@echo off
echo Configuration de la base de données pour le système de réservation...
echo.
echo Veuillez exécuter ce script SQL dans votre base de données:
echo.
echo 1. Ouvrez phpMyAdmin ou MySQL Workbench
echo 2. Sélectionnez la base de données 'reservi_db'
echo 3. Copiez et collez le contenu du fichier 'setup_database.sql'
echo 4. Exécutez le script
echo.
echo Ou utilisez la commande MySQL: mysql -u root -p reservi_db < setup_database.sql
echo.
echo Une fois le script exécuté, redémarrez le backend.
pause
