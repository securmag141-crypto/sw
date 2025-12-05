const { createApp } = Vue;

<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCzlKQEyvyotCMLrVMYwMED9y3DjZUWr7c",
    authDomain: "guard-app-new.firebaseapp.com",
    projectId: "guard-app-new",
    storageBucket: "guard-app-new.firebasestorage.app",
    messagingSenderId: "145470948800",
    appId: "1:145470948800:web:51d7452b232471cf7bb425"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script>
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

createApp({
    data() {
        return {
            login: 'admin@test.com',
            password: '123456',
            error: '',
            user: null,
            userRole: '',
            newData: '',
            dataList: []
        }
    },
    mounted() {
        auth.onAuthStateChanged(user => {
            console.log('Пользователь:', user?.email);
            this.user = user;
            if (user) {
                this.loadUserRole(user.uid);
                this.loadData();
            } else {
                this.userRole = '';
            }
        });
    },
    methods: {
        async signIn() {
            try {
                await auth.signInWithEmailAndPassword(this.login, this.password);
            } catch (err) {
                this.error = err.message;
            }
        },
        async signOut() {
            await auth.signOut();
        },
        async loadUserRole(uid) {
            console.log('Загружаю роль для UID:', uid);
            try {
                const doc = await db.collection('users').doc(uid).get();
                console.log('Документ роли:', doc.data());
                this.userRole = doc.exists ? doc.data().role : 'guard';
                console.log('Установлена роль:', this.userRole);
            } catch (err) {
                console.error('Ошибка загрузки роли:', err);
                this.userRole = 'guard';
            }
        },
        async loadData() {
            try {
                const snapshot = await db.collection('posts').orderBy('createdAt').get();
                this.dataList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
            }
        },
        async addData() {
            if (this.userRole !== 'admin') {
                alert('Только старший смены может добавлять данные');
                return;
            }
            if (!this.newData.trim()) return;
            
            await db.collection('posts').add({
                text: this.newData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                author: this.user.email
            });
            this.newData = '';
            this.loadData();
        },
        async deleteData(postId) {
            if (this.userRole !== 'admin') return;
            if (!confirm('Удалить?')) return;
            
            await db.collection('posts').doc(postId).delete();
            this.loadData();
        }
    }
}).mount('#app');
