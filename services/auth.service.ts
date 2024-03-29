import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';



@Injectable()
export class AuthService {
authState: any = null;
  userRef: AngularFireObject<any>;
  addUserData: any;
constructor(private afAuth: AngularFireAuth,
            private db: AngularFireDatabase,
            private afs: AngularFirestore,
            private router: Router) {
this.afAuth.authState.subscribe((auth) => {
      this.authState = auth;
    });
  }
get authenticated(): boolean {
    return this.authState !== null;
  }
get currentUser(): any {
    return this.authenticated ? this.authState : null;
  }
get currentUserObservable(): any {
    return this.afAuth.authState;
  }
get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }
get currentUserAnonymous(): boolean {
    return this.authenticated ? this.authState.isAnonymous : false;
  }
get currentUserDisplayName(): string {
    if (!this.authState) {
      return 'Guest';
    } else if (this.currentUserAnonymous) {
      return 'Anonymous';
    } else {
      return this.authState['displayName'] || 'User without a Name';
    }
  }
githubLogin() {
    const provider = new firebase.auth.GithubAuthProvider();
    return this.socialSignIn(provider);
  }
googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.socialSignIn(provider);
  }
facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.socialSignIn(provider);
  }
twitterLogin() {
    const provider = new firebase.auth.TwitterAuthProvider();
    return this.socialSignIn(provider);
  }
private socialSignIn(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        console.log(credential.user);
        this.authState = credential.user;
        this.updateUserData();
        this.router.navigate(['/']);
      })
      .catch(error => console.log(error));
  }
anonymousLogin() {
    return this.afAuth.auth.signInAnonymously()
      .then((user) => {
        this.authState = user;
        this.router.navigate(['/']);
      })
      .catch(error => console.log(error));
  }
emailSignUp(email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        this.authState = user;
        this.addUserData(); {
          this.db.list('/users').push({'email': this.authState.email});
          }
        this.router.navigate(['/']);
      })
      .catch(error => console.log(error));
  }
emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((user) => {
        this.authState = user;
        this.updateUserData();
        this.router.navigate(['/']);
      })
      .catch(error => console.log(error));
  }
resetPassword(email: string) {
    const fbAuth = firebase.auth();
    return fbAuth.sendPasswordResetEmail(email)
      .then(() => console.log('email sent'))
      .catch((error) => console.log(error));
  }
getCurrentLoggedIn() {
    this.afAuth.authState.subscribe(auth => {
      if (auth) {
        this.router.navigate(['/']);
      }
    });
  }
signOut(): void {
    this.afAuth.auth.signOut();
    this.router.navigate(['/']);
  }
private updateUserData(): void {
    const path = 'users/${this.currentUserId}'; // Endpoint on firebase
    const userRef: AngularFireObject<any> = this.db.object(path);
    const data = {
      email: this.authState.email,
      name: this.authState.displayName
    };
    userRef.update(data)
      .catch(error => console.log(error));
}

}
