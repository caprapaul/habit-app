import React from "react";
import { Redirect, Route } from "react-router-dom";
import { createAnimation, IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { ItemEdit, ItemList } from "./note";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import { ItemProvider } from "./note/ItemProvider";
import ProtectedRoute from "./PrivateRoute";
import { getToken } from "./core/token-helper";
import UserLogin from "./user/UserLogin";

const App: React.FC = () => {
    const animationBuilder = (
        baseEl: any,
        opts: {
            enteringEl: Element;
            leavingEl: Element;
            direction: "forward" | "back";
        }
    ) => {
        const enteringAnimation = createAnimation()
            .addElement(opts.enteringEl)
            .keyframes([
                {
                    offset: 0,
                    opacity: 0,
                    transform: `translateX(${
                        opts.direction == "back" ? "-" : ""
                    }100%)`,
                },
                { offset: 1, opacity: 1, transform: "translateX(0)" },
            ])
            .duration(250);

        const leavingAnimation = createAnimation()
            .addElement(opts.leavingEl)
            .keyframes([
                { offset: 0, opacity: 1, transform: "translateX(0)" },
                {
                    offset: 1,
                    opacity: 0,
                    transform: `translateX(${
                        opts.direction == "back" ? "" : "-"
                    }100%)`,
                },
            ])
            .duration(250);

        const animation = createAnimation()
            .addAnimation(enteringAnimation)
            .addAnimation(leavingAnimation);

        return animation;
    };

    return (
        <IonApp>
            <ItemProvider>
                <IonReactRouter>
                    <IonRouterOutlet animation={animationBuilder}>
                        <ProtectedRoute
                            path="/items"
                            component={ItemList}
                            exact={true}
                        />
                        <ProtectedRoute
                            path="/item"
                            component={ItemEdit}
                            exact={true}
                        />
                        <ProtectedRoute
                            path="/item/:id"
                            component={ItemEdit}
                            exact={true}
                        />
                        <Route
                            exact
                            path="/"
                            render={() => <Redirect to="/items" />}
                        />
                        <Route
                            path="/login"
                            component={UserLogin}
                            exact={true}
                        />
                    </IonRouterOutlet>
                </IonReactRouter>
            </ItemProvider>
        </IonApp>
    );
};

export default App;
