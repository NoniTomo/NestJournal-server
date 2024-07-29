File storage organization:

```userId```: The ID of the user who owns the notes or files.
```noteId```: ID of the note to which the file belongs.
```file-hash-name```: A unique file name that includes a hash and other metadata, which allows you to uniquely identify the file.

userId noteId file-hash-name
```sh
7 -> | -> 5 -> | -> 20e9bd04-2b94-48a7-a521-0b07c27a388c7738acd7-f56a-4398-b12b-10f10bc9fe44-5-15.jpeg
     |         | -> 24125a26-9226-4bf7-ab98-fe076d33b56f4f0215b2-5a40-4fa4-9616-9e90c43f29d0-5-14.jpeg
     |         | -> ca806081-86df-46d8-b9ec-b58009c8411d42b3b457-b470-478c-bdef-f90442cb5e4f-5-16.jpeg
     |         | -> 8b01e45d-0d82-42aa-8404-4a6875e8cc038fab2ee6-2e0a-445b-84c2-5da051e836bc-5-13.jpeg

     | -> 6 -> | -> 69e7e00f-7a54-4416-9d40-d7b9c5fae7a184109d8e-7263-4a46-8718-7888fdb84375-6-25.jpeg

9

10 -> |-> 10 -> | -> 59450be1-2037-4849-b9ee-22e8a0c2a72299882817-8059-4649-b22e-6112f1a1d179-10-31.jpeg
                | -> a4a06f35-ddeb-4b45-8b3a-cc5f5eeda9908c4d61ac-528d-4fab-83cd-61e09890fdee-10-30.jpeg
```
