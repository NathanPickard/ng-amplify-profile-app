import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { APIService } from '../API.service';
import { Auth } from 'aws-amplify';

import { User } from '../user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  userId: string;
  userName: string;
  user = new User('', '', '', '', '', '');
  showPhoto: boolean;
  userCreated: boolean;

  constructor(private api: APIService, private router: Router) { }

  ngOnInit() {
    this.showPhoto = false;
    Auth.currentAuthenticatedUser({
      bypassCache: false
    })
      .then(async user => {
        this.userId = user.attributes.sub;
        this.userName = user.username;
        let result = await this.api.GetUser(this.userId);
        if (!result) {
          this.userCreated = false;
          this.user = new User('', '', '', '', '', '');
        } else {
          this.userCreated = true;
          this.showPhoto = !!result.image;
          this.user = new User(
            this.userId,
            result.username,
            result.firstName,
            result.lastName,
            result.bio,
            result.image
          )
        }
      })
      .catch(err => console.log(err));
  }

  async updateProfile() {
    const user = {
      id: this.userId,
      username: this.user.firstName + '_' + this.user.lastName,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      bio: this.user.aboutMe,
      image: this.user.imageUrl
    }
    // await this.api.CreateUser(user);
    await this.api[this.getType()](user);
  }

  async onImageUploaded(e) {
    this.user.imageUrl = e.key;
    if (this.userCreated) {
      await this.api.UpdateUser({
        id: this.userId,
        image: this.user.imageUrl
      });
    }
    this.showPhoto = false;
  }

  editPhoto() {
    this.showPhoto = false;
  }

  getType(): string {
    return this.userCreated ? 'UpdateUser' : 'CreateUser';
  }

  logOut() {
    Auth.signOut({ global: true })
      .then(data => {
        this.router.navigate(['/auth']);
      })
      .catch(err => console.log(err));
  }

}