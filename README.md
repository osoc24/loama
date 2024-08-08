![Crest](https://github.com/user-attachments/assets/b083b4d0-f655-4385-9a6e-08c632b860b7)
# Loama

This repository contains multiple projects. To get them running, go through them individually

## Controller `./controller`

The base functionality for...

## Loama `./loama`

The access management app

## Mockbook `./mockbook`

A first demo application to showcase Loama.
MockBook is a social network that allows users to view their posts and friends.

**Data**

- profile: name, email, bio, profile picture
- posts: text, image, video
- friends: list of friends

## Doctorapp `./doctorapp` 

A second demo application to showcase Loama.
DoctorApp is a medical app that allows you to view your doctor appointments.

**Data**

- information: name, email, phone number
- appointments: date, time

## solid-common-lib `./solid-common-lib`

All common functionalities across controller, loama, or (demo) applications

## solid-app-lib `./solid-app-lib`

All common functionalities across (demo) applications,
relies on solid-common-lib.

## Getting started

1. `mkdir -p css/data`: The CSS uses filesystem-based storage
2. `docker compose up -d --wait`

This will spin up a Community Solid Server on port 3000.
